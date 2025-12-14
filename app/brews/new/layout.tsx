export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout without header/footer for the flow experience
  return <>{children}</>;
}
