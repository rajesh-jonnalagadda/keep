"use client";
import { Title } from "@tremor/react";
import { Providers, Provider } from "@/shared/api/providers";
import { useEffect, useState } from "react";
import ProviderForm from "./provider-form";
import ProviderTile from "./provider-tile";
import { useSearchParams } from "next/navigation";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/shared/ui";
import ProviderHealthResultsModal from "@/app/(health)/health/modal";
import { Drawer } from "@/shared/ui/Drawer";

const ProvidersTiles = ({
  title,
  providers,
  installedProvidersMode = false,
  linkedProvidersMode = false,
  isLocalhost = false,
  isHealthCheck = false,
  mutate,
}: {
  title: string;
  providers: Providers;
  installedProvidersMode?: boolean;
  linkedProvidersMode?: boolean;
  isLocalhost?: boolean;
  isHealthCheck?: boolean;
  mutate: () => void;
}) => {
  const searchParams = useSearchParams();
  const [openPanel, setOpenPanel] = useState(false);
  const [openHealthModal, setOpenHealthModal] = useState(false);
  const [healthResults, setHealthResults] = useState({});
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const providerType = searchParams?.get("provider_type");
  const providerName = searchParams?.get("provider_name");

  useEffect(() => {
    if (providerType) {
      // Find the provider based on providerType and providerName
      const provider = providers.find(
        (provider) => provider.type === providerType
      );

      if (provider) {
        setSelectedProvider(provider);
        setOpenPanel(true);
      }
    }
  }, [providerType, providerName, providers]);

  const handleConnectProvider = (provider: Provider) => {
    // on linked providers, don't open the modal
    if (provider.linked) return;
    setSelectedProvider(provider);
    setOpenPanel(true);
  };

  const handleCloseModal = () => {
    setOpenPanel(false);
    setSelectedProvider(null);
  };

  const handleShowHealthModal = () => {
    setOpenHealthModal(true);
  };

  const handleCloseHealthModal = () => {
    setOpenHealthModal(false);
  };

  const handleConnecting = (
    isConnecting: boolean,
    isConnected: boolean,
    healthResults: any
  ) => {
    if (isConnected) handleCloseModal();
    if (isConnected && isHealthCheck) {
      setHealthResults(healthResults);
      handleShowHealthModal();
    }
  };

  const sortedProviders = providers
    .filter(
      (provider) =>
        Object.keys(provider.config || {}).length > 0 ||
        (provider.tags && provider.tags.includes("alert"))
    )
    .sort(
      (a, b) =>
        // Put coming_soon providers at the end
        Number(a.coming_soon) - Number(b.coming_soon) ||
        // Then sort by webhook/oauth capabilities
        Number(b.can_setup_webhook) - Number(a.can_setup_webhook) ||
        Number(b.supports_webhook) - Number(a.supports_webhook) ||
        Number(b.oauth2_url ? true : false) -
          Number(a.oauth2_url ? true : false)
    );

  return (
    <div>
      <div className="flex items-center mb-2.5">
        <Title>{title}</Title>
        {linkedProvidersMode && (
          <div className="relative">
            <Tooltip
              content={
                <>Providers that send alerts to Keep and are not installed.</>
              }
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex flex-wrap mb-5 gap-5">
        {sortedProviders.map((provider) => (
          <ProviderTile
            key={provider.id}
            provider={provider}
            onClick={() => handleConnectProvider(provider)}
          ></ProviderTile>
        ))}
      </div>

      <Drawer
        title={`Connect to ${selectedProvider?.display_name}`}
        isOpen={openPanel}
        onClose={handleCloseModal}
      >
        {selectedProvider && (
          <ProviderForm
            provider={selectedProvider}
            onConnectChange={handleConnecting}
            closeModal={handleCloseModal}
            installedProvidersMode={installedProvidersMode}
            isProviderNameDisabled={installedProvidersMode}
            isLocalhost={isLocalhost}
            isHealthCheck={isHealthCheck}
            mutate={mutate}
          />
        )}
      </Drawer>

      <ProviderHealthResultsModal
        handleClose={handleCloseHealthModal}
        isOpen={openHealthModal}
        healthResults={healthResults}
      />
    </div>
  );
};

export default ProvidersTiles;
