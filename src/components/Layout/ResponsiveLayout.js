/* Responsive Layout Component */
import React from 'react';
import styles from './ResponsiveLayout.module.css';

export const ResponsiveGrid = ({ children, cols = 1, className = '', ...props }) => {
  let gridClass = styles.gridCols1;

  if (cols === 2) {
    gridClass = `${styles.gridCols1} ${styles.mdGridCols2}`;
  } else if (cols === 3) {
    gridClass = `${styles.gridCols1} ${styles.mdGridCols3}`;
  } else if (cols === 4) {
    gridClass = `${styles.gridCols1} ${styles.mdGridCols4}`;
  }

  return (
    <div className={`${styles.responsiveGrid} ${gridClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Container = ({ children, className = '', size = 'default', ...props }) => {
  return (
    <div className={`${styles.container} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Section = ({ children, className = '', padding = 'default', ...props }) => {
  const paddingClass = padding === 'large' ? styles.paddingLarge :
                      padding === 'small' ? styles.paddingSmall : styles.paddingDefault;
  return (
    <section className={`${paddingClass} ${className}`} {...props}>
      {children}
    </section>
  );
};
