import React from 'react';
import asyncComponent from '@crema/utility/asyncComponent';
import AppPage from '@crema/hoc/AppPage';

const DatePicker = asyncComponent(
  () => import('../../../../modules/muiComponents/lab/DatePicker'),
);
export default AppPage(() => <DatePicker />);
