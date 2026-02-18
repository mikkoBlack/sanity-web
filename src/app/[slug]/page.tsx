import { defineQuery } from "next-sanity";
import { draftMode } from "next/headers";
import { client } from "@/sanity/client";
import { notFound } from "next/navigation";

const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  title,
  description,
  "slug": slug.current,
  publishedAt,
  mainImage{
    asset->{
      url
    },
    alt
  },
  author->{
    name
  },
  categories[]->{
    title
  }
}`);

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();

  const data = await client.fetch(
    query,
    { slug },
    isEnabled
      ? { perspective: "drafts", useCdn: false, stega: true }
      : undefined
  );

  if (!data) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="space-y-6 rounded-xl border border-zinc-200 p-6">
        <header className="space-y-2">
          <p className="text-sm text-white text-zinc-500">Post demo</p>
          <h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1>
          <p className="text-sm text-zinc-600">Slug: {data.slug}</p>
          <div>
            <p className="text-sm font-medium text-zinc-700">Description</p>
            <p className="text-zinc-700">
              {data.description || "Add a description in Studio"}
            </p>
          </div>

          <p className="text-sm text-zinc-600">Slug: {data.type}</p>

        </header>

        {data.mainImage?.asset?.url && (
          <img
            src={data.mainImage.asset.url}
            alt={data.mainImage.alt || data.title || "Post image"}
            className="h-auto w-full rounded-lg border border-zinc-200"
          />
        )}

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-700">Author</dt>
            <dd className="text-zinc-900">{data.author?.name || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-700">Published at</dt>
            <dd className="text-zinc-900">
              {data.publishedAt
                ? new Date(data.publishedAt).toLocaleString()
                : "Not set"}
            </dd>
          </div>
        </dl>

        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-700">Categories</h2>
          {data.categories?.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.categories.map((category: { title?: string }, index: number) => (
                <li
                  key={`${category.title || "category"}-${index}`}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm"
                >
                  {category.title || "Untitled"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-600">No categories</p>
          )}
        </section>
      </article>
    </main>
  );
}
