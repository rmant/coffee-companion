import { CoffeeForm } from "@/components/coffee/coffee-form";

export default function NewCoffeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Coffee</h1>
        <p className="text-muted-foreground">Add a new coffee to your collection</p>
      </div>

      <CoffeeForm mode="create" />
    </div>
  );
}
