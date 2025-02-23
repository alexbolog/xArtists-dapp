import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";

import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Artwork from "@/pages/artwork";
import Create from "@/pages/create";
import Profile from "@/pages/profile";
import Governance from "@/pages/governance";
import Proposal from "@/pages/proposal";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/artwork/:id" component={Artwork} />
        <Route path="/create" component={Create} />
        <Route path="/governance" component={Governance} />
        <Route path="/proposal/:id" component={Proposal} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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