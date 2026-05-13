import { Locator, Page } from '@playwright/test';

export const commonLocators = {
  body: (page: Page) => page.locator('body'),
  table: (page: Page) => page.locator('table').first(),
  dataRows: (page: Page) => page.locator('tbody tr:not(.ant-table-measure-row)'),
  rowContaining: (page: Page, text: string) => page.locator('tbody tr').filter({ hasText: text }).first(),
  visibleDataRowContaining: (page: Page, text: string) =>
    page.locator('tbody tr:not(.ant-table-measure-row)').filter({ hasText: text }).first(),
  visiblePopup: (page: Page) =>
    page.locator('.ant-dropdown:not(.ant-dropdown-hidden), .ant-popover, [role="menu"], .ant-drawer').first(),
  exportStartedMessage: (page: Page) =>
    page.getByText(/export started successfully|exported successfully|download started/i).first(),
};

export const authLocators = {
  usernameInput: (page: Page) => page.getByPlaceholder('Enter Email'),
  passwordInput: (page: Page) => page.getByPlaceholder(/password/i)
    .or(page.getByLabel(/password/i))
    .or(page.locator('#password'))
    .or(page.locator('input[name="password"]'))
    .or(page.locator('input[type="password"]'))
    .first(),
  rememberMeCheckbox: (page: Page) => page.locator('#autoLogin').or(page.locator('input[type="checkbox"]')).first(),
  loginButton: (page: Page) => page.getByRole('button', { name: /login|sign in|submit|authenticate/i })
    .or(page.locator('button[type="submit"]'))
    .or(page.locator('form button').first())
    .first(),
  signInButton: (page: Page) => page.getByRole('button', { name: 'Sign In' }),
  otpInputs: (page: Page) => page.locator('.ant-otp input')
    .or(page.locator('input[aria-label*="OTP" i]'))
    .or(page.locator('input[autocomplete="one-time-code"]'))
    .or(page.locator('input[inputmode="numeric"]'))
    .or(page.locator('input[name*="otp" i], input[name*="code" i], input[id*="otp" i], input[id*="code" i]'))
    .or(page.getByLabel(/otp|code|authenticator|verification|mfa|2fa/i))
    .or(page.getByPlaceholder(/otp|code|authenticator|verification|mfa|2fa/i)),
  otpSubmitButton: (page: Page) => page.getByRole('button', { name: /verify|submit|confirm|complete/i })
    .or(page.locator('button[type="submit"]'))
    .first(),
  otpOkayButton: (page: Page) => page.getByRole('button', { name: /okay|ok|continue/i }).first(),
  avatarImg: (page: Page) => page.getByRole('img', { name: /avatar/i }),
  salesLink: (page: Page) => page.getByRole('link', { name: 'Sales' }),
  ordersLink: (page: Page) => page.getByRole('link', { name: 'Orders' }),
};

export const userManagementLocators = {
  heading: (page: Page) => page.getByRole('heading', { name: /user management|users/i }).first(),
  table: commonLocators.table,
  rows: (table: Locator) => table.locator('tbody tr:not(.ant-table-measure-row)'),
  dialog: (page: Page) => page.locator('[role="dialog"], .modal, .ant-modal, .MuiDialog-root').first(),
  searchInput: (page: Page) =>
    page.locator('input[placeholder*="search" i], input[type="search"], input[aria-label*="search" i]').first(),
  createUserButton: (page: Page) =>
    page.getByRole('button', { name: /add user|create user|new user|invite user/i }).first(),
  refreshButton: (page: Page) => page.getByRole('button', { name: /refresh|reload/i }).first(),
  exportButton: (page: Page) => page.getByRole('button', { name: /export|download/i }).first(),
  roleFilter: (page: Page) => page.getByRole('combobox', { name: /role/i }).or(page.getByLabel(/role/i)).first(),
  statusFilter: (page: Page) => page.getByRole('combobox', { name: /status/i }).or(page.getByLabel(/status/i)).first(),
  saveButton: (page: Page) => page.getByRole('button', { name: /save|submit|create|invite/i }).first(),
  cancelButton: (page: Page) => page.getByRole('button', { name: /cancel|close|discard/i }).first(),
  validationMessages: (page: Page) =>
    page.locator('[role="alert"], .error, .invalid-feedback, .ant-form-item-explain-error, .Mui-error'),
  requiredErrorMessages: (page: Page) =>
    page.locator('.ant-form-item-explain-error, [role="alert"], .Mui-error'),
  firstNameInput: (page: Page) => page.locator('#firstName')
    .or(page.getByPlaceholder(/enter first name/i))
    .or(page.getByLabel(/first name/i))
    .first(),
  lastNameInput: (page: Page) => page.locator('#lastName')
    .or(page.getByPlaceholder(/enter last name/i))
    .or(page.getByLabel(/last name/i))
    .first(),
  emailInput: (page: Page) => page.locator('#email')
    .or(page.getByPlaceholder(/please enter email|email/i))
    .or(page.getByLabel(/email/i))
    .first(),
  phoneInput: (page: Page) => page.getByPlaceholder(/705515476|712345678|phone/i)
    .or(page.locator('#phoneNumber'))
    .or(page.getByLabel(/phone number/i))
    .first(),
  identificationNumberInput: (page: Page) => page.locator('#identificationNumber')
    .or(page.getByPlaceholder(/enter identification number/i))
    .or(page.getByLabel(/^identification number$/i))
    .first(),
  companyIdentificationNumberInput: (page: Page) => page.locator('#companyIdentificationNumber')
    .or(page.getByPlaceholder(/enter company identification number/i))
    .or(page.getByLabel(/company identification number/i))
    .first(),
  countryCodeSelect: (page: Page) => page.getByRole('combobox', { name: /country code/i }).first(),
  identificationTypeSelect: (page: Page) => page.getByRole('combobox', { name: /identification type/i }).first(),
  roleSelect: (page: Page) => page.getByRole('combobox', { name: /roles/i }).first(),
  branchSelect: (page: Page) => page.getByRole('combobox', { name: /branches/i }).first(),
  departmentSelect: (page: Page) => page.getByRole('combobox', { name: /departments/i }).first(),
  body: commonLocators.body,
  selectPopup: (page: Page) => page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last(),
  selectOption: (popup: Locator) => popup.locator('.ant-select-item-option:not(.ant-select-item-option-disabled)'),
  selectedValue: (dropdown: Locator) => dropdown
    .locator('.ant-select-selection-item, .ant-select-selection-overflow-item, .ant-select-selection-item-content')
    .filter({ hasText: /\S/ })
    .first(),
  text: (page: Page, pattern: RegExp) => page.getByText(pattern).first(),
  textParent: (page: Page, pattern: RegExp) => page.getByText(pattern).locator('..'),
  pageTitleText: (page: Page) => page.getByText(/user management|users/i).first(),
  exportDropdown: (page: Page) => page.locator('.ant-dropdown:not(.ant-dropdown-hidden), .ant-menu, [role="menu"]').first(),
  exportDropdownItems: (dropdown: Locator) => dropdown.locator('[role="menuitem"], .ant-menu-item, li, button, a'),
  exportIcon: (page: Page, label: RegExp) => page.getByRole('img', { name: /pdf/i.test(label.source) ? /file-pdf/i : /file-excel/i }).first(),
  nextPageButton: (page: Page) =>
    page.locator(
      '.ant-pagination-next:not(.ant-pagination-disabled) button, ' +
      'button[aria-label*="next" i]:not([disabled]), ' +
      'li[title="Next Page"]:not(.ant-pagination-disabled)',
    ).first(),
  sortTrigger: (page: Page) =>
    page.locator(
      'button[aria-label*="sort" i], ' +
      '.ant-table-column-sorters, ' +
      'th .ant-table-column-sorter, ' +
      '[data-testid*="sort" i], ' +
      'button:has-text("Sort"), ' +
      '.ant-dropdown-trigger:has([aria-label*="sort" i])',
    ).first(),
  filterTrigger: (page: Page) =>
    page.locator(
      'button[aria-label*="filter" i], ' +
      '.ant-table-filter-trigger, ' +
      '[data-testid*="filter" i], ' +
      'button:has-text("Filter"), ' +
      '.ant-dropdown-trigger:has([aria-label*="filter" i])',
    ).first(),
  firstNameFallbackInput: (page: Page) => page.locator('#firstName, input[placeholder*="first" i]').first(),
  roleFallbackSelect: (page: Page) => page.locator('#rolePublicIds, .ant-select').first(),
  statusSwitch: (page: Page) => page.getByRole('switch').last().or(page.locator('.ant-switch').last()),
  confirmButton: (page: Page, name: RegExp) => page.getByRole('button', { name }).last(),
};

export const rolesPermissionsLocators = {
  rolesTab: (page: Page) => page.getByRole('tab', { name: 'Roles' }),
  permissionGroupsTab: (page: Page) => page.getByRole('tab', { name: 'Permission Groups' }),
  addRoleButton: (page: Page) =>
    page.locator('button:has(span:text-is("Add Role"))').or(page.getByRole('button', { name: /add role/i })).first(),
  filtersButton: (page: Page) => page.getByRole('button', { name: /filter/i }).first(),
  refreshButton: (page: Page) => page.locator('.anticon-reload').first(),
  addPermissionGroupButton: (page: Page) => page.getByRole('button', { name: /add permission group/i }),
  saveButton: (page: Page) => page.getByRole('button', { name: /save/i }).first(),
  cancelButton: (page: Page) => page.getByRole('button', { name: /cancel/i }).first(),
  resetButton: (page: Page) => page.getByRole('button', { name: /reset/i }).first(),
  roleNameInput: (page: Page) => page.getByRole('textbox', { name: /role name/i }),
  permissionGroupNameInput: (page: Page) =>
    page.getByRole('textbox', { name: /enter name/i }).or(page.getByRole('textbox', { name: /permission group name/i })),
  permissionInput: (page: Page) => page.getByRole('textbox', { name: /enter permission/i }),
  addPermissionButton: (page: Page) => page.getByText('+ Add'),
  nextButton: (page: Page) => page.getByRole('button', { name: /next/i }),
  previousButton: (page: Page) => page.getByRole('button', { name: /previous/i }),
  confirmAndSaveButton: (page: Page) => page.getByRole('button', { name: /confirm and save/i }),
  moduleSelect: (page: Page) => page.locator('.ant-select-selection-overflow').first(),
  rolesTable: (page: Page) =>
    page.getByRole('tabpanel', { name: /^Roles$/ }).locator('table').first().or(page.locator('[id*="panel-roles"] table').first()),
  permissionGroupsTable: (page: Page) =>
    page.getByRole('tabpanel', { name: /^Permission Groups$/ }).locator('table').first().or(page.locator('[id*="panel-permissions"] table').first()),
  tableRows: (table: Locator) => table.locator('tbody tr:not(.ant-table-measure-row)'),
  rolesTabText: (page: Page) => page.locator('div').filter({ hasText: /^Roles$/ }).first(),
  statusSwitch: (page: Page) => page.getByRole('switch').or(page.locator('.ant-switch')).last(),
  rowMenu: (page: Page) => page.locator('.ant-dropdown:not(.ant-dropdown-hidden), .ant-dropdown-menu'),
  viewOption: (page: Page) => rolesPermissionsLocators.rowMenu(page).getByText('View', { exact: true }).last(),
  addPermissionsAction: (row: Locator) =>
    row.getByText(/add permissions/i).or(row.getByRole('button', { name: /add permissions/i })).first(),
  editOption: (page: Page) =>
    page.locator('span').filter({ hasText: /^Edit$/ }).or(page.getByText('Edit', { exact: true })).last(),
  permissionGroupEditNameInput: (page: Page) =>
    page.getByRole('textbox', { name: /permission group name|enter name/i }).first(),
  deleteOption: (page: Page) => page.getByText('Delete', { exact: true }),
  confirmDeleteButton: (page: Page) => page.getByRole('button', { name: /^delete$/i }).last(),
  successToast: (page: Page) => page.locator('.ant-message-success, .ant-notification-notice-success, [class*="success"]').first(),
  errorToast: (page: Page) => page.locator('.ant-message-error, .ant-notification-notice-error, [class*="error"]').first(),
  validationError: (page: Page) => page.locator('.ant-form-item-explain-error, [role="alert"], .Mui-error').first(),
  rowActionButton: (row: Locator) => row.getByRole('button').or(row.locator('.anticon-ellipsis').locator('..')).last(),
  dropdownOptions: (page: Page) =>
    page.locator('.ant-select-item-option:not(.ant-select-item-option-disabled), .ant-dropdown-menu-item'),
  confirmButton: (page: Page) => page.getByRole('button', { name: /confirm|yes|ok/i }).last(),
  inlineAddPermissionsButton: (row: Locator) =>
    row.getByRole('button', { name: /add permissions/i }).or(row.locator('td').filter({ hasText: /add permissions/i })).first(),
  addPermissionsText: (page: Page) => page.getByText(/add permissions/i).first(),
  permissionCheckbox: (page: Page, permission: string) => page.getByRole('checkbox', { name: permission }),
  allCheckboxes: (page: Page) => page.getByRole('checkbox'),
  rows: (page: Page) => page.getByRole('row').or(page.locator('tbody tr:not(.ant-table-measure-row)')),
  exportIcon: (page: Page, exportIconName: RegExp) => page.getByRole('img', { name: exportIconName }).first(),
  assignedPermissionsPanel: (page: Page) =>
    page.locator('div').filter({ hasText: /assigned permissions/i }).first(),
  resetButtonLast: (page: Page) => page.getByRole('button', { name: /reset/i }).last(),
  editIcon: (row: Locator) => row.locator('span[class*="edit"], .anticon-edit, span:nth-child(2)').first(),
};

export const locationManagementLocators = {
  addCountryButton: (page: Page) => page.getByRole('button', { name: /add country/i }),
  addCityButton: (page: Page) => page.getByRole('button', { name: /add city/i }),
  addDistrictButton: (page: Page) => page.getByRole('button', { name: /add a district|add district/i }),
  addBranchButton: (page: Page) => page.getByRole('button', { name: /add a branch|add branch/i }),
  addDepartmentButton: (page: Page) => page.getByRole('button', { name: /add a department|add department/i }),
  addRejectionCodeButton: (page: Page) => page.getByRole('button', { name: /add rejection code/i }),
  departmentNameCandidates: ['#name', '#departmentName', 'input[name="name"]', 'input[placeholder*="department" i]'],
  descriptionCandidates: ['#description', 'textarea[name="description"]', 'textarea[placeholder*="description" i]'],
  countryNameSelect: (page: Page) => page.locator('#name'),
  countryPublicIdSelect: (page: Page) => page.locator('#countryPublicId'),
  cityPublicIdSelect: (page: Page) => page.locator('#cityPublicId'),
  districtRegionIdSelect: (page: Page) => page.locator('#regionId'),
  departmentPublicIdSelect: (page: Page) => page.locator('#departmentPublicId'),
  moduleSelect: (page: Page) => page.locator('#module'),
  nameInput: (page: Page) => page.locator('#name'),
  codeInput: (page: Page) => page.locator('#code'),
  regionNameInput: (page: Page) => page.locator('#regionName'),
  descriptionInput: (page: Page) => page.locator('#description'),
  table: commonLocators.table,
  rows: commonLocators.dataRows,
  rowContaining: commonLocators.rowContaining,
  visibleDataRowContaining: commonLocators.visibleDataRowContaining,
  sorterForColumn: (page: Page, columnName: RegExp) =>
    page.locator('th').filter({ hasText: columnName }).locator('.ant-table-column-sorters, .ant-table-column-sorter').first(),
  firstSorter: (page: Page) => page.locator('.ant-table-column-sorters, th .ant-table-column-sorter').first(),
  filterForColumn: (page: Page, columnName: RegExp) =>
    page.locator('th').filter({ hasText: columnName }).locator('.ant-table-filter-trigger').first(),
  firstFilter: (page: Page) =>
    page.locator('.ant-table-filter-trigger, button[aria-label*="filter" i], button:has-text("Filter")').first(),
  filterPopup: commonLocators.visiblePopup,
  searchInput: (page: Page) =>
    page.locator('input[placeholder*="search" i], input[type="search"]')
      .filter({ hasNot: page.locator('[role="combobox"]') })
      .first(),
  fallbackDialogInput: (page: Page) =>
    page.locator('.ant-modal input:not([type="hidden"]), [role="dialog"] input:not([type="hidden"])').first(),
  formDialog: (page: Page) => page.locator('.ant-modal, [role="dialog"]').first(),
  bySelector: (page: Page, selector: string) => page.locator(selector).first(),
  selectOptions: (page: Page) =>
    page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:not(.ant-select-item-option-disabled)'),
};
