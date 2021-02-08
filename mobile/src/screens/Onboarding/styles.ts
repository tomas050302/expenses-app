import { StyleSheet } from 'react-native';

import theme from '../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 3,
    alignItems: 'center'
  },

  paginator: {
    flexDirection: 'row',
    height: 64
  },

  dot: {
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: theme.colors.secondaryDark,

    marginHorizontal: theme.units.margin.xsm
  }
});

export default styles;
