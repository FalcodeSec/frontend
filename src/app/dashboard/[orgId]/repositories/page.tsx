import { RepositoriesPage } from "src/components/dashboard/repositories-page";

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId } = await params;
  return <RepositoriesPage organizationId={orgId} />;
}