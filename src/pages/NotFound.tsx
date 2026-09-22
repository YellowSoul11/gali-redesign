export default function NotFound() {
  return (
    <section className="shell py-28 lg:py-40">
      <h1 className="display text-[clamp(3rem,2rem+4vw,5.5rem)]">העמוד לא נמצא</h1>
      <p className="soft mt-4 text-lg text-ink-2 max-w-[40ch]">ייתכן שהקישור השתנה או שהמוצר כבר לא זמין.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/" className="btn btn-primary">לדף הבית</a>
        <a href="/new" className="btn btn-outline">לקולקציה החדשה</a>
      </div>
    </section>
  );
}
