import { test as baseTest } from '@playwright/test'
import { _common } from "./common";
import { _loginPage } from '../pageFactory/auth/login';
import { SalesPage } from '../pageFactory/sales/sales';
import { OrdersPage } from '../pageFactory/sales/orders';
import { CustomersPage } from '../pageFactory/sales/customers';
import { SalesAgentPage } from '../pageFactory/sales/salesAgent';
import { VanSalesPage } from '../pageFactory/sales/vanSales';
import { SAPerformancePage } from '../pageFactory/sales/saPerformance';
import { DiscountsPage } from '../pageFactory/sales/discounts';
import { DiscountApprovalsPage } from '../pageFactory/sales/discountApprovals';
import { CorporateCustomerApprovalsPage } from '../pageFactory/sales/corporateCustomerApprovals';

const test = baseTest.extend<{
    common: _common;
    loginPage: _loginPage;
    salesPage: SalesPage;
    ordersPage: OrdersPage;
    customersPage: CustomersPage;
    salesAgentPage: SalesAgentPage;
    vanSalesPage: VanSalesPage;
    saPerformancePage: SAPerformancePage;
    discountsPage: DiscountsPage;
    discountApprovalsPage: DiscountApprovalsPage;
    corporateApprovalsPage: CorporateCustomerApprovalsPage;
}>({
    common: async ({page, context, baseURL}, use)=>{
        await use(new _common(page, context, baseURL))
    },
    loginPage: async ({page}, use)=>{
        await use(new _loginPage(page))
    },
    salesPage: async ({page}, use)=>{
        await use(new SalesPage(page))
    },
    ordersPage: async ({page}, use)=>{
        await use(new OrdersPage(page))
    },
    customersPage: async ({page}, use)=>{
        await use(new CustomersPage(page))
    },
    salesAgentPage: async ({page}, use)=>{
        await use(new SalesAgentPage(page))
    },
    vanSalesPage: async ({page}, use)=>{
        await use(new VanSalesPage(page))
    },
    saPerformancePage: async ({page}, use)=>{
        await use(new SAPerformancePage(page))
    },
    discountsPage: async ({page}, use)=>{
        await use(new DiscountsPage(page))
    },
    discountApprovalsPage: async ({page}, use)=>{
        await use(new DiscountApprovalsPage(page))
    },
    corporateApprovalsPage: async ({page}, use)=>{
        await use(new CorporateCustomerApprovalsPage(page))
    },
});

export default test;