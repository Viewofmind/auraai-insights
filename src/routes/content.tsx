import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/content")({
  component: ContentLayout,
});

function ContentLayout() {
  return <Outlet />;
}
