export default function About() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* About Me Section */}
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            About Me
          </h1>
          <p className="leading-7 mt-4 sm:mt-6">
            Hi, I&apos;m Andy Yang, a passionate software engineer with a love for creating innovative solutions. I am currently pursuing my Master&apos;s in Computer Science at the University of Michigan.
          </p>
          <p className="leading-7 mt-4 sm:mt-6">
            When I&apos;m not working on software projects, I like to snowboard, work on my project car, play poker, collect antique tennis rackets and play golf.
          </p>
        </section>

        {/* What I'm Doing Now Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            What I&apos;m Doing Now
          </h2>
          <span className="text-lg font-normal">(Updated: September 2024)</span>
          <ul className="list-disc list-outside leading-7 mt-4 sm:mt-6 pl-5">
            <li className="mb-2">Completing my Master&apos;s in Computer Science at the University of Michigan</li>
            <li className="mb-2">Recruiting for fulltime software engineering roles</li>
            <li className="mb-2">Leading a team to do a redesign of the <a href="https://sanxi.com" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">sanxi.com</a> website</li>
            <li className="mb-2">Trying to finish round of golf without losing any balls</li>
            <li className="mb-2">My NA Miata is reaching 100k miles!</li>
          </ul>
        </section>

        {/* Tools I Use Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            Tools I&apos;ve Used
          </h2>
          <ul className="list-disc list-outside leading-7 mt-4 sm:mt-6 pl-5">
            <li className="mb-2">Languages: C++, C#, Python, Java, JavaScript, HTML/CSS, MATLAB, R</li>
            <li className="mb-2">Technologies: Next.js, React, Flask, REST APIs, MySQL, MongoDB, Git, Docker, AWS EC2, FANUC, Unreal Engine</li>
          </ul>
        </section>

        {/* My Timeline Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            My Timeline
          </h2>
          <ul className="list-disc list-outside leading-7 mt-4 sm:mt-6 pl-5">
            <li className="mb-2">2024: Recieved my Bachelor&apos;s degree and started my Master&apos;s through the SUGS program</li>
            <li className="mb-2">2024: Interned at MiTek Inc working on computer vision software for automated building component manufacturing </li>
            <li className="mb-2">2020: Started my Bachelor&apos;s degree in Computer Science at the University of Michigan College of Engineering</li>
            <li className="mb-2">2018: Went to UC Berkeley for summer school, took CS61A, absolutely loved it, and decided to pursue a degree in Computer Science</li>
            <li className="mb-2">2016: Wrote my first line of code in <a href="https://scratch.mit.edu/" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">Scratch</a> </li>
            <li className="mb-2">2010: Move to Vancouver, Canada. Fell in love with snowboarding</li>
            <li>2002: Born in Fuzhou, China</li>
          </ul>
        </section>

        {/* Contacts Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            Contacts
          </h2>
          <p className="leading-7 mt-4 sm:mt-6">
            Feel free to reach out to me through the following channels:
          </p>
          <ul className="list-disc list-outside leading-7 mt-4 sm:mt-6 pl-5">
            <li className="mb-2">
              Email: <a href="mailto:andyyhyang@gmail.com" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">andyyhyang@gmail.com</a>
            </li>
            <li className="mb-2">
              LinkedIn: <a href="https://www.linkedin.com/in/andyyhy" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">linkedin.com/in/andyyhy</a>
            </li>
            <li className="mb-2">
              Instagram: <a href="https://www.instagram.com/andyyhy02/" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.instagram.com/andyyhy02/</a>
            </li>
            <li className="mb-2">
              GitHub: <a href="https://github.com/andyyhy" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">github.com/andyyhy</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
