import { Button, TextInput } from "@/components/ui";
import { useWorkflowStore } from "@/entities/workflows";
import {
  BackspaceIcon,
  FunnelIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Text, Subtitle, Icon, Switch } from "@tremor/react";
import { EditorLayout } from "./StepEditor";
import { capitalize } from "@/utils/helpers";
import { getHumanReadableInterval } from "@/entities/workflows/lib/getHumanReadableInterval";
import { debounce } from "lodash";
import { useCallback } from "react";
import CelInput from "@/features/cel-input/cel-input";
import { useFacetPotentialFields } from "@/features/filter";
import { AlertsCountBadge } from "@/features/presets/create-or-update-preset/ui/alerts-count-badge";
import { useConfig } from "@/utils/hooks/useConfig";

export function TriggerEditor() {
  const {
    v2Properties: properties,
    updateV2Properties,
    updateSelectedNodeData,
    selectedNode,
    validationErrors,
  } = useWorkflowStore();

  const { data: config } = useConfig();

  const docsUrl = config?.KEEP_DOCS_URL || "https://docs.keep.dev";

  const saveNodeDataDebounced = useCallback(
    debounce((key: string, value: string | Record<string, any>) => {
      updateSelectedNodeData(key, value);
    }, 300),
    [updateSelectedNodeData]
  );

  const handleChange = (key: string, value: string | Record<string, any>) => {
    updateV2Properties({ [key]: value });
    if (key === "interval") {
      updateSelectedNodeData("properties", { interval: value });
    }
  };

  const updateAlertFilter = (filter: string, value: string) => {
    const currentProperties = properties.alert || {};
    if (!currentProperties.filters) {
      currentProperties.filters = {};
    }
    const newProperties = { ...currentProperties, [filter]: value };
    updateV2Properties({ alert: newProperties });
    saveNodeDataDebounced("properties", newProperties);
  };

  const updateAlertCel = (value: string) => {
    const currentProperties = properties.alert || {};
    updateV2Properties({ alert: { ...currentProperties, cel: value } });
    saveNodeDataDebounced("properties", { ...currentProperties, cel: value });
  };

  const addFilter = () => {
    const filterName = prompt("Enter filter name");
    if (filterName) {
      updateAlertFilter(filterName, "");
    }
  };

  const deleteFilter = (filter: string) => {
    const currentProperties = { ...properties.alert };
    delete currentProperties.filters[filter];
    updateV2Properties({ alert: currentProperties });
  };

  const triggerKeys = ["alert", "incident", "interval", "manual"];

  if (!selectedNode || !triggerKeys.includes(selectedNode)) {
    return null;
  }

  const selectedTriggerKey = triggerKeys.find(
    (key) => key === selectedNode
  ) as string;
  const error = validationErrors?.[selectedTriggerKey];

  const renderTriggerContent = () => {
    const { data: alertFields } = useFacetPotentialFields("alerts");

    switch (selectedTriggerKey) {
      case "manual":
        return (
          // TODO: explain what is manual trigger
          <div>
            <input
              type="checkbox"
              checked={true}
              onChange={(e) =>
                handleChange(
                  selectedTriggerKey,
                  e.target.checked ? "true" : "false"
                )
              }
              disabled={true}
            />
          </div>
        );

      case "alert":
        return (
          <>
            {error && (
              <Text className="text-red-500 mb-1.5">
                {Array.isArray(error) ? error[0] : error}
              </Text>
            )}
            <div>
              <div className="flex  items-center">
                <Subtitle>CEL Expression</Subtitle>
                <Icon
                  icon={QuestionMarkCircleIcon}
                  variant="simple"
                  color="gray"
                  className="cursor-pointer"
                  size="sm"
                  onClick={() => {
                    window.open(`${docsUrl}/overview/cel`, "_blank");
                  }}
                  tooltip="Read more about CEL expressions"
                />
              </div>
              <div className="flex items-center mt-1 relative">
                <CelInput
                  staticPositionForSuggestions={true}
                  value={properties.alert.cel}
                  placeholder="CEL expression based trigger"
                  onValueChange={(value: string) => updateAlertCel(value)}
                  onClearValue={() => updateAlertCel("")}
                  fieldsForSuggestions={alertFields}
                />
              </div>
              <div className="mt-4">
                <AlertsCountBadge
                  vertical
                  presetCEL={properties.alert.cel}
                  isDebouncing={false}
                  description="The number of alerts from the past that would have triggered this workflow"
                />
              </div>
            </div>
            <div>
              <Subtitle className="mt-2.5">Alert filter (deprecated)</Subtitle>
              <Text className="text-sm text-gray-500">
                Please convert your alert filters to CEL expressions to ensure
                stability and performance.
              </Text>
              <div className="w-1/2">
                <Button
                  onClick={addFilter}
                  size="xs"
                  className="ml-1 mt-1"
                  variant="light"
                  color="gray"
                  icon={FunnelIcon}
                >
                  Add Filter
                </Button>
              </div>
              {properties.alert.filters &&
                Object.keys(properties.alert.filters ?? {}).map((filter) => (
                  <div key={filter}>
                    <Subtitle className="mt-2.5">{filter}</Subtitle>
                    <div className="flex items-center mt-1">
                      <TextInput
                        key={filter}
                        placeholder={`Set alert ${filter}`}
                        onChange={(e: any) =>
                          updateAlertFilter(filter, e.target.value)
                        }
                        value={
                          (properties.alert.filters as any)[filter] ||
                          ("" as string)
                        }
                      />
                      <Icon
                        icon={BackspaceIcon}
                        className="cursor-pointer"
                        color="red"
                        tooltip={`Remove ${filter} filter`}
                        onClick={() => deleteFilter(filter)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </>
        );

      case "incident":
        return (
          <>
            <Subtitle className="mt-2.5">Incident events</Subtitle>
            {Array("created", "updated", "deleted").map((event) => (
              <div key={`incident-${event}`} className="flex">
                <Switch
                  id={event}
                  checked={properties.incident.events?.indexOf(event) > -1}
                  onChange={() => {
                    let events = properties.incident.events || [];
                    if (events.indexOf(event) > -1) {
                      events = (events as string[]).filter((e) => e !== event);
                      updateV2Properties({
                        [selectedTriggerKey]: { events: events },
                      });
                    } else {
                      events.push(event);
                      updateV2Properties({
                        [selectedTriggerKey]: { events: events },
                      });
                    }
                  }}
                  color={"orange"}
                />
                <label
                  htmlFor={`incident-${event}`}
                  className="text-sm text-gray-500"
                >
                  <Text>{event}</Text>
                </label>
              </div>
            ))}
          </>
        );

      case "interval": {
        const value = properties[selectedTriggerKey];
        return (
          <>
            <Subtitle className="mt-2.5">Interval (in seconds)</Subtitle>
            <TextInput
              placeholder={`Set the ${selectedTriggerKey}`}
              onChange={(e: any) =>
                handleChange(selectedTriggerKey, e.target.value)
              }
              value={value || ("" as string)}
              error={!!error}
              errorMessage={error?.[0]}
            />
            {value && (
              <Text className="text-sm text-gray-500">
                Workflow will run every {getHumanReadableInterval(value)}
              </Text>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <EditorLayout>
      <Subtitle className="font-medium flex items-baseline justify-between">
        {capitalize(selectedTriggerKey)} Trigger
      </Subtitle>
      <div className="flex flex-col gap-2">{renderTriggerContent()}</div>
    </EditorLayout>
  );
}
