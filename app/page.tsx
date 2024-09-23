import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <main className="flex flex-col-reverse md:flex-row items-start md:items-center mb-8 sm:mb-10 md:mb-12">
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
      </div>
    </div>
  );
}