// app/page.tsx
import Link from 'next/link'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'
import ScoreDemo from '@/app/components/score-demo'

const steps = [
  {
    title: 'Say what it is for',
    body: 'Add a title if you have one, then describe the occasion, the scripture or the feeling you want the words to carry. Choose the language and the church season.',
  },
  {
    title: 'Read the words',
    body: 'You get four verses of four lines, all on the same syllable pattern, so one tune fits every verse. Save the hymns you want to keep.',
  },
  {
    title: 'Play and print the four parts',
    body: 'Faithbeat composes a tune and sets soprano, alto, tenor and bass around it. Listen to it, then print the score for rehearsal.',
  },
]

const specimens = [
  { language: 'Igbo', letters: 'ị ọ ụ ṅ' },
  { language: 'Yorùbá', letters: 'ẹ ọ ṣ à á' },
  { language: 'Hausa', letters: 'ɓ ɗ ƙ' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero: the product itself */}
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20">
          <div className="lg:col-span-5">
            <h1 className="display text-[3.6rem] sm:text-[5.2rem] lg:text-[5.6rem]">
              Write a hymn for this Sunday.
            </h1>
            <p className="text-serif-body mt-7 max-w-[34rem] text-[1.3rem] text-ink-2">
              Describe the occasion and what the words should say. Faithbeat writes the lyrics in Igbo,
              Yorùbá, Hausa or English, then sets them for four voices, with sheet music your choir can
              play, print and rehearse from.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/create"
                className="rounded-md bg-spruce px-6 py-3.5 text-[1.05rem] font-medium text-white hover:bg-spruce-2"
              >
                Write a hymn
              </Link>
              <Link
                href="/discover"
                className="text-[1.05rem] font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
              >
                Browse shared hymns
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ScoreDemo />
          </div>
        </section>

        {/* How it works: a real sequence */}
        <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8 sm:mt-28">
          <h2 className="heading max-w-2xl text-[2.3rem] sm:text-[3rem]">
            From a few sentences to a part each singer can read
          </h2>
          <ol className="mt-12 grid border-t border-ink md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="border-b border-rule py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <span className="display text-[3.4rem] text-ink-3">{i + 1}</span>
                <h3 className="heading mt-3 text-[1.45rem]">{s.title}</h3>
                <p className="text-serif-body mt-3 text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Languages: a type specimen, not a feature tile */}
        <section className="mx-auto mt-20 grid max-w-6xl gap-10 px-5 sm:mt-28 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="heading text-[2.3rem] sm:text-[3rem]">
              Set in a typeface made for your languages
            </h2>
            <p className="text-serif-body mt-5 max-w-[30rem] text-ink-2">
              Dotted vowels, tone marks and hooked consonants stay clear on screen and on the printed
              page, in the lyrics and under every note.
            </p>
          </div>
          <dl className="border-t border-ink lg:col-span-7">
            {specimens.map((s) => (
              <div
                key={s.language}
                className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-rule py-5 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="text-sm text-ink-3">{s.language}</dt>
                <dd className="font-serif text-[2.6rem] leading-tight tracking-wide sm:text-[3.4rem]">
                  {s.letters}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Honesty about what is generated and what is rule-based */}
        <section className="on-board mt-20 bg-board text-chalk sm:mt-28">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-12">
            <h2 className="heading text-[2.2rem] text-white sm:text-[2.8rem] lg:col-span-5">
              The harmony follows the rules of choral writing
            </h2>
            <div className="text-serif-body space-y-5 text-[1.25rem] text-chalk lg:col-span-6 lg:col-start-7">
              <p>
                An AI model writes the words and proposes the tune. It does not write the four parts. A
                rule-based arranger does, keeping every voice inside a comfortable range and avoiding
                parallel fifths and octaves, so what you print can actually be sung.
              </p>
              <p className="text-chalk-2">
                Read Igbo, Yorùbá and Hausa lyrics with a native speaker before the hymn goes into a
                service. Faithbeat gives you a strong first draft, not a final text.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-20 sm:px-8 sm:pt-28">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-ink pt-10 md:flex-row md:items-end">
            <h2 className="display max-w-xl text-[2.8rem] sm:text-[4rem]">Start with one sentence.</h2>
            <Link
              href="/create"
              className="rounded-md bg-spruce px-6 py-3.5 text-[1.05rem] font-medium text-white hover:bg-spruce-2"
            >
              Write your first hymn
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}