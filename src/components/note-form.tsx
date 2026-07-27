"use client";

import { useRef, useTransition } from "react";
import { createNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTE_TYPE_LABELS, type NoteType } from "@/lib/types";

export function NoteForm({ bookId }: { bookId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const typeRef = useRef<NoteType>("summary");
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent>
        <form
          ref={formRef}
          action={(formData) => {
            formData.set("book_id", String(bookId));
            formData.set("note_type", typeRef.current);
            startTransition(async () => {
              const result = await createNote(formData);
              if (!result?.error) {
                formRef.current?.reset();
              }
            });
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                defaultValue="summary"
                onValueChange={(v) => {
                  typeRef.current = v as NoteType;
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {NOTE_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="page_number">Página (opcional)</Label>
              <Input
                id="page_number"
                name="page_number"
                type="number"
                min={1}
                placeholder="Ex: 42"
                className="sm:w-32"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Anotação</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={3}
              placeholder="Escreva sua anotação aqui..."
            />
          </div>

          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Salvando..." : "Adicionar anotação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
