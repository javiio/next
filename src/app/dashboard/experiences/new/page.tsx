import { ExperienceForm } from "@/components/experiences/experience-form";

export default function NewExperiencePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">New experience</h1>
      <ExperienceForm />
    </div>
  );
}
