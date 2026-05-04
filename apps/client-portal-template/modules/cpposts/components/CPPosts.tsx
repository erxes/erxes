import { useGetCPPosts } from '../hooks/useGetCPPosts';

export const CPPosts = () => {
  const { data, loading, error } = useGetCPPosts();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;
  return (
    <div>
      {data?.getCPExamplePosts?.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};
