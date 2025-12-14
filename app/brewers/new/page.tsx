import { BrewerForm } from "@/components/brewer/brewer-form";

export default function NewBrewerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Brewer</h1>
        <p className="text-muted-foreground">Add a new brewer to your equipment</p>
      </div>

      <BrewerForm />
    </div>
  );
}
