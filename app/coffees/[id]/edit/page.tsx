import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoffeeForm } from "@/components/coffee/coffee-form";

export default async function EditCoffeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coffee, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !coffee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Coffee</h1>
        <p className="text-muted-foreground">{coffee.name}</p>
      </div>

      <CoffeeForm coffee={coffee} mode="edit" />
    </div>
  );
}
