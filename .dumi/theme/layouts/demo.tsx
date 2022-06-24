﻿import { SettingDrawer } from '@bicitech-design/pro-components';
import { isBrowser } from 'umi';

export default ({ children, location, ...rest }) => {
  if (!isBrowser()) {
    return children;
  }
  if (location.pathname.startsWith('/~demos/layout')) {
    return children;
  }

  return (
    <div
      style={{
        padding: 24,
      }}
    >
      <div
        style={{
          padding: 24,
          border: '1px solid #f0f0f0',
        }}
      >
        {children}
        <SettingDrawer themeOnly enableDarkTheme />
      </div>
    </div>
  );
};
