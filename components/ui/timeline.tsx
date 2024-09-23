import React, { ReactNode }from 'react';

const timelineData = [
  {
    date: '2024 - Present',
    title: (
      <>
        <a href="https://sanxi.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8BC34A]">Sanxi Group</a>
      </>
    ),
    description: (
      <>
        Leading a team to revamp <a href="https://sanxi.com" target="_blank" rel="noopener noreferrer" className="hover:underline">sanxi.com</a>
      </>
    ),
  },
  {
    date: '2023 - 2024',
    title: (
      <>
        <a href="https://www.mii.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8BC34A]">MiTek Inc.</a>
      </>
    ),
    description: 'Systems Software Engineering Intern',
  },
  {
    date: '2020 - 2025',
    title: (
      <>
        <a href="https://umich.edu" target="_blank" rel="noopener noreferrer" className="hover:text-[#8BC34A]">University of Michigan</a>
      </>
    ),
    description: "Bachelor's and Master's in Computer Science",
  },
  
  
  
  // Add more items as needed
];

const TimelineItem = ({ date, title, description }: { date: string, title: ReactNode, description: ReactNode }) => {
  return (
    <ol className="relative border-l border-gray-200 pl-2">
      <li className="mb-10 ml-4">
        <div className="absolute w-5 h-5 bg-gray-200 rounded-full -left-2.5 border"></div>
        <time className="mb-1 text-sm font-normal leading-none text-gray-500 ">
          {date}
        </time>
        <h3 className="text-lg font-semibold text-gray-400">
          {title}
        </h3>
        <p className="text-base font-normal text-gray-500">
          {description}
        </p>
      </li>
    </ol>
  );
};

const Timeline = () => {
  return (
    <div className="relative flex flex-col pl-8">
      {timelineData.map((item, index) => (
        <TimelineItem
          key={index}
          date={item.date}
          title={item.title}  // Pass the element directly
          description={item.description}
        />
      ))}
    </div>
  );
};

export default Timeline;