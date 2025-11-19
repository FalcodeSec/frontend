import { BitbucketRepositorySelection } from "@/src/components/dashboard/bitbucket-repository-selection";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId } = await params;
  return <BitbucketRepositorySelection organizationId={orgId} />;
}

