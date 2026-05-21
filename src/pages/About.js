import { Link } from 'react-router-dom';

function About() {
  const teamMembers = [
    {
      name: 'Chan D. Sohor',
      role: 'Chief Technology Officer',
      photo: '/assets/cto.png',
      description:
        'Chan architects the backbone of our platform, ensuring every transaction is fast, secure, and seamless.',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-400/20',
      accent: 'text-blue-400',
    },
    {
      name: 'Chanchan S. Delenia',
      role: 'Head of Marketing',
      photo: '/assets/head of m.jpg',
      description:
        'Chanchan crafts the voice of K-Dream, connecting our brand with fans across social media and beyond.',
      gradient: 'from-pink-500/10 to-rose-500/10',
      border: 'border-pink-400/20',
      accent: 'text-pink-400',
    },
    {
      name: 'Chrischan D. Sojor',
      role: 'Head of Operations',
      photo: '/assets/head of op.png',
      description:
        'Chrischan keeps the gears of K-Dream turning smoothly — from logistics to customer support.',
      gradient: 'from-purple-500/10 to-violet-500/10',
      border: 'border-purple-400/20',
      accent: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">About Us</h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            K-Dream Merchandise is your official K-pop merchandise distributor.
          </p>
        </section>
        <section className="grid md:grid-cols-2 gap-10 mb-20">
          <article className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-300">To be the world&apos;s most trusted hub for K-pop fans worldwide.</p>
          </article>
          <article className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-300">To provide safe trading and authentic merchandise for every fan.</p>
          </article>
        </section>
        <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">Meet the Team</h2>
        <div className="flex justify-center mb-10">
          <article className="p-8 border border-purple-400/30 rounded-3xl max-w-xs text-center">
            <img src="/assets/ceo.jpg" alt="Christian D. Sojor" className="w-32 h-40 mx-auto mb-5 rounded-2xl object-cover" />
            <h3 className="text-xl font-bold">Christian D. Sojor</h3>
            <p className="text-purple-400 text-sm">Chief Executive Officer</p>
          </article>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((m) => (
            <article key={m.name} className={`p-7 bg-gradient-to-br ${m.gradient} border ${m.border} rounded-3xl text-center`}>
              <img src={m.photo} alt={m.name} className="w-28 h-36 mx-auto mb-5 rounded-2xl object-cover" />
              <h3 className="text-lg font-bold">{m.name}</h3>
              <p className={`${m.accent} text-xs uppercase mb-3`}>{m.role}</p>
              <p className="text-gray-400 text-sm">{m.description}</p>
            </article>
          ))}
        </div>
        <p className="text-center">
          <Link to="/" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default About;