import { BitbucketRepositorySelection } from "@/src/components/dashboard/bitbucket-repository-selection";

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId } = await params;
  return <BitbucketRepositorySelection organizationId={orgId} />;
}

