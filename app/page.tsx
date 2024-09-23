import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { featuredProjects } from "./projectsData";
import Link from "next/link";
import Timeline from '@/components/ui/timeline';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-10 md:p-12">
        <main className="max-w-4xl w-full h-dvh m-auto flex flex-col-reverse justify-center md:flex-row items-start md:items-center mb-8 sm:mb-10 lg:mb-12">
          <div className="md:w-2/3 md:pr-6">
            <p className="text-[#8BC34A]">Hey! I&apos;m</p>
            <h1 className="text-gray-400 scroll-m-20 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl my-6">
              Andy (Yu Han) Yang
            </h1>
            <h2 className="text-gray-400 text-xl">CSE Master&apos;s student at the <a href="https://cse.engin.umich.edu" className="text-[#8BC34A] hover:underline">University of Michigan</a></h2>
            <p className="leading-7 mt-2 sm:mt-4 text-gray-500">
              I enjoy creating digital experiences and solving everyday problems through innovative software solutions.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-12 md:w-1/3 flex justify-start md:justify-center">
            <Image
              className="block md:hidden h-auto w-36 mb-10 rounded-full shadow-xl dark:shadow-gray-800"
              src="/me-small.jpeg"
              alt="Andy Yang"
              width={200}
              height={200}
            />
            <Image
              className="hidden md:block h-auto max-w-xs rounded-lg shadow-xl dark:shadow-gray-800"
              src="/me1.jpeg"
              alt="Andy Yang"
              width={400}
              height={400}
            />
          </div>
        </main>
      <div className="w-full max-w-4xl mx-auto">
        <section id="about" className="text-gray-400 flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/2 mb-20 md:mb-0">
            <h2 className="text-2xl font-bold mb-8">About Me</h2>
            <p className="leading-7 text-gray-500">
              Hi, I&apos;m Andy Yang, I enjoy creating digital experiences and solving everyday problems through innovative software solutions. I am currently pursuing my Master&apos;s in Computer Science at the University of Michigan.
            </p>
            <p className="leading-7 text-gray-500 mt-4 sm:mt-6">
              When I&apos;m not in front of a computer screen, I like to snowboard, work on my project car, play poker, play golf, and collect antique tennis rackets.
            </p>
          </div>
          <div className="md:w-1/2 md:pr-6 flex justify-center">
            <Timeline />
          </div>
        </section>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-24">
        <section id="skills" className="text-gray-400">
          <h2 className="text-2xl font-bold mb-8">Tech I've Been Using Recently </h2>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-8">
              <h3 className="text-xl font-semibold mb-4">Programming Languages</h3>
              <p className="leading-7 text-gray-500">
                Python, C++, Typescript, JavaScript, C, Java
              </p>
            </div>
            <div className="md:w-1/3 mb-8">
              <h3 className="text-xl font-semibold mb-4">Tools</h3>
              <p className="leading-7 text-gray-500">
                Git, Docker, VS Code, Nginx, FANUC, UE5, AWS, MySQL
              </p>
            </div>
            <div className="md:w-1/3">
              <h3 className="text-xl font-semibold mb-4">Frameworks</h3>
              <p className="leading-7 text-gray-500">
                React, Next.js, Flask, Pytorch
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-24">
        <section className="text-gray-400">
          <h2 className="text-2xl font-bold mb-8">Some Projects I&apos;ve Worked On</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <Card key={index} className="shadow-lg"> 
                <CardHeader>
                  <CardTitle className="text-xl ">{project.name}</CardTitle>
                  <CardDescription>{project.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{project.description}</p>
                </CardContent>
                <CardFooter className="flex space-x-4">
                  <Link href={project.demoLink} target="_blank" rel="noopener noreferrer">
                    <svg className="ml-2 h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <title>YouTube</title>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </Link>
                  <Link href={project.sourceLink} target="_blank" rel="noopener noreferrer">
                    <svg className="ml-2 h-6 w-6 text-gray-500 hover:text-[#8BC34A] transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <title>Github</title>
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/projects">
              <Button variant="default">
                View All Projects
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}