import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { projects } from "./projectsData";
import Link from "next/link";

export default function Projects() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <section className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
            My Projects
          </h2>
          <p className="leading-7 mt-4 sm:mt-6">
            Here are some of the projects I have worked on over the years.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="shadow-lg bg-neutral-200"> 
                <CardHeader>
                  <CardTitle className="text-xl text-pink-600">{project.name}</CardTitle>
                  <CardDescription>{project.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{project.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={project.demoLink} target="_blank" rel="noopener noreferrer" className={`${buttonVariants({ variant: "outlineDark" })}`}>Demo<ExternalLink className="ml-2 h-4 w-4" /> </Link>
                  <Link href={project.sourceLink} target="_blank" rel="noopener noreferrer" className={`${buttonVariants({ variant: "outlineDark" })}`}>Source<ExternalLink className="ml-2 h-4 w-4" /> </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
