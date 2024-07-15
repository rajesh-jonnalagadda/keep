import React, { useState, useEffect } from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import { Callout, Italic, Button } from "@tremor/react";
import Link from "next/link";
import { Workflow } from './models';
import { useRouter } from "next/navigation";

const links = [
  {
    href: '/learn-basics',
    label: 'Learn more about Workflows',
  },
  {
    href: '/create-notification',
    label: 'How to create a basic notification flow',
  },
  {
    href: '/get-support',
    label: 'Get support on your Workflow',
  },
];


const DetailsSection = () => {

  const router = useRouter();
  return (
    <section className="flex flex-col items-center justify-center mb-10">
      <h2 className="sm:text-2xl  text-xl font-bold">Create your first workflow</h2>
      <p className="mt-2 font-bold text-sm">You do not have any workflow added yet.</p>
      <div className="text-sm mt-4 text-gray-500 max-w-md text-center">you can start by creating your very first Workflow from scratch, or browse thorugh some available Workflow templates below</div>
      <Button
        className="mt-4 px-6 py-2"
        color="orange"
        variant="primary"
      >
        <Link href="/workflows/builder">Create a new workflow</Link>
      </Button>
      {/* <div className="mt-10 p-4 divide-y divide-gray-200 border border-gray-200 shadow-sm"> */}
      <div className="mt-10 divide-y flex flex-col border border-gray-200 rounded bg-white flex flex-col shadow">
        {links.map((link) => (
          <div
            onClick={() => { router.push(link.href) }}
            className="flex items-center p-2 bg-white hover:bg-gray-100 transition cursor-pointer"
          >
            <span className="flex-shrink-0 w-6 h-6 mr-4 bg-gray-200 flex items-center justify-center">
              {/* Add your icon here, for now using a placeholder */}
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </span>
            {link.label}
            <span className="ml-auto">
              {/* Arrow icon */}
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};





const WorkflowsEmptyState = () => {
  const loadAlert = () => document.getElementById("uploadWorkflowButton")?.click();

  return (
    <div className="mt-4">
      {/* <Callout
        title="No Workflows"
        icon={CircleStackIcon}
        color="yellow"
        className="mt-5"
      >
        You can start by uploading a workflow file using the{" "}
        <Italic onClick={loadAlert} className="underline cursor-pointer">
          Load a Workflow
        </Italic>{" "}
        button above or by using the{" "}
        <Italic className="underline">
          <Link href="/workflows/builder">Workflow Builder</Link>
        </Italic>{" "}
        to create a new workflow.
      </Callout> */}
      <DetailsSection />
    </div>
  );
};

export default WorkflowsEmptyState;

