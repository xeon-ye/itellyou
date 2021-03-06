import React from 'react';
import { ContainerQuery } from 'react-container-query';
import classnames from 'classnames';
import Layout from './Layout';
import Sider from './Sider';

const query = {
    middle: {
        minWidth: 1200,
        maxWidth: 1999,
    },
    wider: {
        minWidth: 2000,
    },
};

export default ({ mode, children, className }) => {
    const isContainer = (type, param) => {
        return mode ? mode === type : param === type;
    };

    return (
        <ContainerQuery query={query}>
            {param => (
                <div
                    className={classnames(
                        {
                            'layout-container': true,
                            'layout-container-wider': isContainer('wider', param),
                            'layout-container-middle': isContainer('middle', param),
                            'layout-container-full': isContainer('full', param),
                            clearfix: true,
                        },
                        className,
                    )}
                >
                    {children}
                </div>
            )}
        </ContainerQuery>
    );
};

export { Layout, Sider };
