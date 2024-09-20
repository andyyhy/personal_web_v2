import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <main className="flex flex-col-reverse md:flex-row items-start md:items-center mb-8 sm:mb-10 md:mb-12">
          <div className="md:w-2/3 md:pr-6">
            <h1 className="scroll-m-20 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl">
              Hey! I'm Andy Yang
            </h1>
            <p className="leading-7 mt-4 sm:mt-6">
              I'm a Masters student at Umich studying Computer Science and sometimes I am a Software Engineer.
            </p>
            <p className="leading-7 mt-4 sm:mt-6">
              On this site, you can check out projects I have worked on and cool stuff I have done for fun.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-12 md:w-1/3 flex justify-start md:justify-center">
            <img
              className="block md:hidden h-auto w-36 mb-10 rounded-full shadow-xl dark:shadow-gray-800"
              src="/me-small.jpeg"
              alt="Andy Yang"
            />
            <img
              className="hidden md:block h-auto max-w-xs rounded-lg shadow-xl dark:shadow-gray-800"
              src="/me1.jpeg"
              alt="Andy Yang"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
