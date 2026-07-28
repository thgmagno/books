import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function UserAvatar({
  name,
  email,
  image,
  className,
}: {
  name: string | null;
  email: string;
  image: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {image && <AvatarImage src={image} alt={name ?? email} />}
      <AvatarFallback>{initials(name, email)}</AvatarFallback>
    </Avatar>
  );
}
