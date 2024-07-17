import React, { useState } from "react";
import { MockWorkflow, Workflow } from './models';
import { getApiURL } from "../../utils/apiUrl";
import Loading from "../loading";
import { Button } from "@tremor/react";
import Modal from "@/components/ui/Modal";
import PageClient from "./builder/page.client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TiArrowRight } from "react-icons/ti";



export function WorkflowSteps({ workflow }: { workflow: MockWorkflow}) {
  const isActionPresent = !!workflow?.actions?.length;
  return (
    <div className="flex gap-2 items-center mb-4 flex-wrap">
      {workflow?.actions?.map((step: any, index: number) => {
        console.log("step in action", step, index);
        const provider = step?.provider;
        return (
          <div key={`action-${index}`} className="flex items-center gap-2">
            {index > 0 && <TiArrowRight style={{ width: 30, height: 30 }} className="text-gray-500 align-self: center" />}
            <Image
              src={`/icons/${provider?.type}-icon.png`}
              width={30}
              height={30}
              alt={provider?.type}
              className="mt-6"
            />
          </div>
        );
      })}
      {workflow?.steps?.map((step: any, index: number) => {
        console.log("step in steps", step);
        const provider = step?.provider;
        return (
          <div key={`step-${index}`} className="flex items-center gap-2">
            {(index > 0 || isActionPresent) && (
              <TiArrowRight style={{ width: 30, height: 30 }} className="text-gray-500 align-self: center" />
            )}
            <Image
              src={`/icons/${provider?.type}-icon.png`}
              width={30}
              height={30}
              alt={provider?.type}
              className="mt-6"
            />
          </div>
        );
      })}
    </div>
  );
}

export default function MockWorkflowCardSection({ mockWorkflows, mockError, mockLoading }:{
  mockWorkflows: MockWorkflow[],
  mockError: any,
  mockLoading: boolean | null,
}) {
  const router = useRouter();

  const getNameFromId = (id: string) => {
    if (!id) {
      return '';
    }

    return id.split('-').join(' ');
  }

  console.log("mockWorkflows====>", mockWorkflows);

  // if mockError is not null, handle the error case
  if (mockError) {
    return <p>Error: {mockError.message}</p>;
  }

  return (
    <section className="pt-10 mt-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6">Discover existing workflow templates</h2>
      <div className="flex flex-col sm:flex-row justify-between mb-6 flex-wrap">
        <div className="flex gap-2 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search through workflow examples..."
            className="px-4 py-2 border rounded w-full sm:w-auto"
          />
          <button className="px-4 py-2 bg-gray-200 border rounded">Integrations used</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-gray-200 border rounded">All workflows</button>
          <button className="px-4 py-2 bg-gray-200 border rounded">Notifications</button>
          <button className="px-4 py-2 bg-gray-200 border rounded">Databases</button>
          <button className="px-4 py-2 bg-gray-200 border rounded">CI/CD</button>
          <button className="px-4 py-2 bg-gray-200 border rounded">Other</button>
        </div>
      </div>

      {mockError && <p className="text-center text-red-100 m-auto">Error: {mockError.message || "Something went wrong!"}</p>}
      {!mockLoading && !mockError && mockWorkflows.length === 0 && <p className="text-center m-auto">No workflows found</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockError && <p className="text-center text-red-100">Error: {mockError.message || "Something went wrong!"}</p>}
        {mockLoading && <Loading />}
        {!mockLoading && mockWorkflows.length > 0 && mockWorkflows.map((template: any, index: number) => {
          const workflow = template.workflow;
          console.log("insise th emao workflwo", workflow);
          return (
            <div key={index} className="card p-4 border rounded bg-white flex flex-col shadow">
              <div className="flex-grow">
                <WorkflowSteps workflow={workflow} />
                <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{workflow.name || getNameFromId(workflow.id)}</h3>
                <p className="mt-2 text-sm sm:text-base line-clamp-3">{workflow.description}</p>
              </div>
              <div className="mt-auto">
                <Button
                  className="inline-block mt-8 px-4 py-2 border-none bg-gray-200 hover:bg-gray-300 bold-medium transition text-black rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.setItem('preview_workflow', JSON.stringify(template));
                    router.push(`/workflows/preview/${workflow.id}`);
                  }}
                >
                  Preview
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
