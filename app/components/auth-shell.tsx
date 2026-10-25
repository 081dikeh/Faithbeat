import Logo from './logo'

const points = [
  'Save every hymn you write',
  'Play and print the four parts',
  'Share a link, or keep it private',
]

export default function AuthShell({
  heading,
  intro,
  children,
}: {
  heading: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <aside className="on-board hidden flex-col justify-between bg-board p-12 text-chalk lg:flex">
        <Logo className="text-white" />
        <div>
          <p className="display max-w-md text-[3.4rem] text-white">Your hymns, wherever your choir meets.</p>
          <ul className="mt-10 max-w-sm border-t border-chalk/25">
            {points.map((p) => (
              <li key={p} className="border-b border-chalk/25 py-3.5 text-[1.05rem]">
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-chalk-2">Igbo, Yorùbá, Hausa and English.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Logo className="mb-10 lg:hidden" />
          <h1 className="heading text-[2.4rem]">{heading}</h1>
          <p className="text-serif-body mt-2 text-ink-2">{intro}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}