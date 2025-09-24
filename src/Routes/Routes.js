import About from "../Pages/About/About";
import AccountRanking from "../Pages/AccountRanking/AccountRanking";
import Home from "../Pages/Home/Home";
import NewAccount from "../Pages/NewAccount/NewAccount";
import PowerDownLists from "../Pages/PowerDownLists/PowerDownLists";
import PowerHolders from "../Pages/PowerHolders/PowerHolders";
import WithnessList from "../Pages/WithnessList/WinthnessList";
import WitnessMonitor from "../Pages/WitnessMonitor/WitnessMonitor";
import CommunityData from "../Pages/CommunityData/CommunityData";
import ContentHistory from "../Pages/ContentHistory/ContentHistory";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import BlockResult from "../Pages/BlockResult/BlockResult";
import TransactionResult from "../Pages/TransactionResult/TransactionResult";
import AccountResult from "../Pages/AccountResult/AccountResult";
import Blocks from "../Pages/Blocks/Blocks";

const Routes =   [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/power-holders",
      element: <PowerHolders />,
    },
    {
      path: "/power-down-lists",
      element: <PowerDownLists />,
    },
    {
      path: "/new-account",
      element: <NewAccount />,
    },
    {
      path: "/account-ranking",
      element: <AccountRanking />,
    },
    {
      path: "/witness-list",
      element: <WithnessList />,
    },
    {
      path: "/witness-monitor",
      element: <WitnessMonitor />,
    },
    {
      path: "/community-data",
      element: <CommunityData />,
    },
    {
      path: "/content-history",
      element: <ContentHistory />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/blocks",
      element: <Blocks />,
    },
    {
      path: "/blocks/:blockNumber",
      element: <BlockResult />,
    },
    {
      path: "/transactions/:transactionId",
      element: <TransactionResult />,
    },
    {
      path: "/accounts/:accountName",
      element: <AccountResult />,
    },
    {
      path: "*",
      element: <ErrorBoundary />,
    },
  ]

  export default Routes;