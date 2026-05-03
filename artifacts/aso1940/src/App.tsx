import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { AssociationsList } from "@/pages/AssociationsList";
import { AssociationForm } from "@/pages/AssociationForm";
import { AssociationDetail } from "@/pages/AssociationDetail";
import { MemberForm } from "@/pages/MemberForm";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/associations" component={AssociationsList} />
        <Route path="/associations/new">
          {() => <AssociationForm />}
        </Route>
        <Route path="/associations/:id/edit">
          {(params) => <AssociationForm associationId={parseInt(params.id)} />}
        </Route>
        <Route path="/associations/:id/members/new">
          {(params) => <MemberForm associationId={parseInt(params.id)} />}
        </Route>
        <Route path="/associations/:id/members/:memberId/edit">
          {(params) => <MemberForm associationId={parseInt(params.id)} memberId={parseInt(params.memberId)} />}
        </Route>
        <Route path="/associations/:id">
          {(params) => <AssociationDetail id={parseInt(params.id)} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
