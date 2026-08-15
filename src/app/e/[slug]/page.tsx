import { notFound } from "next/navigation";
import { getExperienceBySlug } from "@/lib/experiences/queries";
import { getTemplate } from "@/templates";

export default async function ExperiencePage(props: PageProps<"/e/[slug]">) {
  const { slug } = await props.params;

  const experience = await getExperienceBySlug(slug);
  if (!experience) {
    notFound();
  }

  const template = getTemplate(experience.template);
  if (!template) {
    throw new Error(
      `Unknown template "${experience.template}" for experience "${slug}".`,
    );
  }

  const result = template.schema.safeParse(experience.data);
  if (!result.success) {
    throw new Error(
      `Invalid data for experience "${slug}" (template "${experience.template}"): ${result.error.message}`,
    );
  }

  const Component = template.component;
  return <Component data={result.data} />;
}
