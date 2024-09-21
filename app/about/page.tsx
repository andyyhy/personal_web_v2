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
            What I&apos;m Doing Now <span className="text-lg font-normal">(Updated: September 2024)</span>
          </h2>
          <ul className="list-disc list-inside leading-7 mt-4 sm:mt-6">
            <li>Completing my Master&apos;s in Computer Science at the University of Michigan</li>
            <li>Recruiting for fulltime software engineering roles</li>
            <li>Leading a team to do a redesign of the sanxi.com website</li>
            <li>Trying to finish round of golf without losing any balls</li>
            <li>Staying updated with the latest trends in the tech industry</li>
          </ul>
        </section>

        {/* Tools I Use Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            Tools I&apos;ve Used
          </h2>
          <ul className="list-disc list-inside leading-7 mt-4 sm:mt-6">
            <li>Python</li>
            <li>C++</li>
            <li>Java</li>
            <li>Flask</li>
            <li>React and Next.js</li>
            <li>MongoDB</li>
            <li>MySQL</li>
            <li>Git</li>
            <li>AWS</li>
            <li>ROS</li>
            <li>Unreal Engine 5</li>
            <li>FANUC</li>
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
            <li className="mb-2">2016: Wrote my first line of code in <a href="https://scratch.mit.edu/" className="text-pink-600">Scratch</a> </li>
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
          <ul className="list-disc list-inside leading-7 mt-4 sm:mt-6">
            <li>Email: <a href="mailto:andyyhyang@gmail.com" className="text-pink-600">andyyhyang@gmail.com</a></li>
            <li>LinkedIn: <a href="https://www.linkedin.com/in/andyyhy" className="text-pink-600">linkedin.com/in/andyyhy</a></li>
            <li>Instagram: <a href="https://www.instagram.com/andyyhy02/" className="text-pink-600">https://www.instagram.com/andyyhy02/</a></li>
            <li>GitHub: <a href="https://github.com/andyyhy" className="text-pink-600">github.com/andyyhy</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
