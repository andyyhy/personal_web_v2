import Image from "next/image";

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
            Hi, I'm Andy Yang, a passionate software developer with a love for creating innovative solutions. I am currently pursuing my Masters in Computer Science at the University of Michigan.
          </p>
          <p className="leading-7 mt-4 sm:mt-6">
            I have a strong background in software engineering and have worked on various projects that span different domains. I enjoy exploring new technologies and continuously improving my skills.
          </p>
          <p className="leading-7 mt-4 sm:mt-6">
            In my free time, I love to work on personal projects, contribute to open-source, and share my knowledge with the community. Feel free to explore my website to learn more about my work and interests.
          </p>
        </section>

        {/* What I'm Doing Now Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            What I'm Doing Now
          </h2>
          <p className="leading-7 mt-4 sm:mt-6">
            Currently, I am focused on completing my Masters in Computer Science at the University of Michigan. I am also working on several personal projects and contributing to open-source communities.
          </p>
          <p className="leading-7 mt-4 sm:mt-6">
            In addition, I am exploring new technologies and methodologies to enhance my skills and stay updated with the latest trends in the tech industry.
          </p>
        </section>

        {/* Tools I Use Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            Tools I Use
          </h2>
          <ul className="list-disc list-inside leading-7 mt-4 sm:mt-6">
            <li>Visual Studio Code</li>
            <li>Git and GitHub</li>
            <li>Node.js</li>
            <li>React and Next.js</li>
            <li>Docker</li>
            <li>Postman</li>
            <li>Figma</li>
            <li>Slack</li>
          </ul>
        </section>

        {/* My Timeline Section */}
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            My Timeline
          </h2>
          <ul className="list-disc list-inside leading-7 mt-4 sm:mt-6">
            <li>2023: Started my Masters in Computer Science at the University of Michigan</li>
            <li>2021: Graduated with a Bachelor's degree in Computer Science</li>
            <li>2020: Interned at XYZ Company as a Software Engineer</li>
            <li>2019: Started contributing to open-source projects</li>
            <li>2018: Developed my first web application</li>
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
            <li>Email: <a href="mailto:andy@example.com" className="text-blue-500">andy@example.com</a></li>
            <li>LinkedIn: <a href="https://www.linkedin.com/in/andy-yang" className="text-blue-500">linkedin.com/in/andy-yang</a></li>
            <li>GitHub: <a href="https://github.com/andy-yang" className="text-blue-500">github.com/andy-yang</a></li>
            <li>Twitter: <a href="https://twitter.com/andy_yang" className="text-blue-500">@andy_yang</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
