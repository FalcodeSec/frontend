import { GitLabRepositorySelection } from "@/src/components/dashboard/gitlab-repository-selection";

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId } = await params;
  return <GitLabRepositorySelection organizationId={orgId} />;
}

