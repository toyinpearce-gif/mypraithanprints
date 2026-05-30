import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "../../../../lib/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
