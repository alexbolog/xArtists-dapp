import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { UnlockPage } from "@multiversx/sdk-dapp/UI/pages/UnlockPage";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals";
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal";

import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Artwork from "@/pages/artwork";
import Create from "@/pages/create";
import Profile from "@/pages/profile";
import Governance from "@/pages/governance";
import Proposal from "@/pages/proposal";
import Stake from "@/pages/stake";
import NotFound from "@/pages/not-found";
import FaucetPage from "@/pages/faucet";
import { getChainId } from "./contracts/config";

function Router() {
  const environment = getChainId() === "D" ? "devnet" : "mainnet";
  return (
    <DappProvider environment={environment}>
      <TransactionsToastList />
      <SignTransactionsModals />
      <NotificationModal />
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/artwork/:id" component={Artwork} />
          <Route path="/create" component={Create} />
          <Route path="/governance" component={Governance} />
          <Route path="/proposal/:id" component={Proposal} />
          <Route path="/profile" component={Profile} />
          <Route path="/stake" component={Stake} />
          <Route
            path="/unlock"
            component={() => <UnlockPage loginRoute={"/"} />}
          />
          <Route path="/faucet" component={FaucetPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </DappProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
