import React from 'react';
import {
  AppShell,
  Navbar,
  UnstyledButton,
  Group,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  PlusIcon,
  NoteIcon,
  SortDescIcon,
  DatabaseIcon,
  HomeIcon,
  LogIcon,
  GitCompareIcon,
  OrganizationIcon,
} from '@primer/octicons-react';
import { NavLink, Outlet } from 'react-router-dom';

function MainLink({ icon, color, label, to }) {
  const activeStyle = {
    backgroundColor: '#302c2c',
    textDecoration: 'none',
  };

  const deactiveStyle = {
    textDecoration: 'none',
  };
  return (
    <NavLink
      to={to}
      style={({ isActive }) => (isActive ? activeStyle : deactiveStyle)}
    >
      <UnstyledButton
        sx={(theme) => ({
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          backgroundColor: 'inherit',
          color:
            theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

          '&:hover': {
            backgroundColor:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
          },
        })}
      >
        <Group>
          <ThemeIcon color={color} variant="light">
            {icon}
          </ThemeIcon>

          <Text size="sm">{label}</Text>
        </Group>
      </UnstyledButton>
    </NavLink>
  );
}

const MainLayout = () => {
  const linksData = [
    {
      icon: <HomeIcon size={16} />,
      color: 'orange',
      label: 'خانه',
      to: '/',
    },
    {
      icon: <PlusIcon size={16} />,
      color: 'teal',
      label: 'افزودن کالا',
      to: 'add',
    },
    {
      icon: <GitCompareIcon size={16} />,
      color: 'red',
      label: 'انتقال کالا',
      to: 'transfer',
    },
    {
      icon: <OrganizationIcon size={16} />,
      color: 'violet',
      label: 'مکان ها',
      to: 'places',
    },
    {
      icon: <LogIcon size={16} />,
      color: 'grape',
      label: 'تاریخچه',
      to: 'log',
    },
    {
      icon: <DatabaseIcon size={16} />,
      color: 'blue',
      label: 'پشتیبان گیری',
      to: 'backup',
    },
  ];
  const links = linksData.map((link) => {
    return <MainLink {...link} key={link.label} />;
  });
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 200 }} height="100vh" p="xs">
          <Navbar.Section>{links}</Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
};

export default MainLayout;
