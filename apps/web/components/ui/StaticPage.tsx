export function StaticPage({ title, html }: { title: string; html: string }) {
  return (
    <main className="relative z-10 min-h-screen pt-32">
      <div className="mx-auto max-w-3xl px-gutter py-section">
        <h1 className="font-display text-5xl uppercase tracking-tight mb-8">{title}</h1>
        <div
          className="prose prose-invert max-w-none space-y-6 text-zirios-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
