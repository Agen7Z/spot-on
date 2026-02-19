import React from "react";
import heroImage from "../assets/hero.png";

export function Landing({ onGetStarted }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white text-neutral-800">
      {/* HERO */}
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        {/* Left */}
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-rose-100 px-4 py-1 text-sm font-medium text-rose-600">
            Spot On · Gentle cycle care
          </span>

          <h1 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
            Understand your body.
            <br />
            <span className="text-pink-600">Feel in control.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-neutral-600">
            Track your cycle, understand symptoms, and receive thoughtful
            reminders designed around you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-7 py-3 font-medium text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5"
            >
              Start tracking
            </button>

            <button
              onClick={onGetStarted}
              className="rounded-full border border-rose-200 px-7 py-3 font-medium text-neutral-700 transition hover:bg-rose-50"
            >
              Sign in
            </button>
          </div>

          <div className="mt-6 flex gap-6 text-sm text-neutral-500">
            <span>Private</span>
            <span>Secure</span>
            <span>Personalized</span>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative h-[420px] flex items-center justify-center">
          <img src={heroImage} alt="Spot On Hero" className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <header className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl">
            Designed for comfort and clarity
          </h2>
          <p className="mt-3 text-neutral-600">
            Everything you need to understand your cycle without overwhelm.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon="🩷"
            title="Adaptive predictions"
            text="Smart forecasting that learns your rhythm over time."
          />
          <Feature
            icon="🌸"
            title="Symptom journaling"
            text="Log mood, flow and body signals in seconds."
          />
          <Feature
            icon="🔔"
            title="Calm reminders"
            text="Helpful nudges when they matter."
          />
          <Feature
            icon="📊"
            title="Clear insights"
            text="Simple visual trends that support health decisions."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="rounded-2xl bg-white p-8 text-center shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{text}</p>
    </article>
  );
}
