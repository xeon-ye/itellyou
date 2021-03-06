import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, Link } from 'umi';
import { Table, Avatar } from 'antd';
import Layout from '../components/Layout';
import Loading from '@/components/Loading';
import CardMenu from '../components/CardMenu';
import Timer from '@/components/Timer';
import styles from './index.less';

const fetchList = (dispatch, offset, limit, member_id, parmas) => {
    return dispatch({
        type: 'column/list',
        payload: {
            append: offset > 0,
            offset,
            limit,
            member_id,
            ...parmas,
        },
    });
};

const UserColumn = () => {
    const [page, setPage] = useState(1);
    const limit = 20;
    const dispatch = useDispatch();
    const dataSource = useSelector((state) => state.column.list);
    const me = useSelector((state) => state.user.me);
    const loadingEffect = useSelector((state) => state.loading);
    const loading = loadingEffect.effects['column/list'];

    const renderPage = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a>上一页</a>;
        }
        if (type === 'next') {
            return <a>下一页</a>;
        }
        return originalElement;
    };

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (_, { id, name, path, avatar, description }) => {
                return (
                    <div className={styles['column-title']}>
                        <div className={styles['avatar']}>
                            <Avatar shape="circle" size={38} src={avatar} />
                        </div>
                        <div className={styles['content']}>
                            <Link to={`/${path}`}>{name}</Link>
                            <p>{description}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 120,
            render: (text) => {
                return <Timer time={text} />;
            },
        },
    ];

    const renderTable = () => {
        if (!dataSource) return <Loading />;
        return (
            <Loading loading={loading}>
                <Table
                    rowKey={(row) => row.id}
                    columns={columns}
                    dataSource={dataSource.data}
                    pagination={{
                        onChange: (page) => {
                            setPage(page);
                            fetchList(dispatch, (page - 1) * limit, limit, me.id);
                        },
                        current: page,
                        itemRender: renderPage,
                        hideOnSinglePage: true,
                        pageSize: limit,
                        total: dataSource ? dataSource.total : 0,
                    }}
                />
            </Loading>
        );
    };

    return (
        <Layout defaultKey="column">
            <CardMenu>{renderTable()}</CardMenu>
        </Layout>
    );
};

UserColumn.getInitialProps = async ({ isServer, store, params }) => {
    const { dispatch, getState } = store;
    const state = getState();
    const { user } = state;
    const { me } = user || {};
    if (me) {
        await fetchList(dispatch, 0, 20, (me || {}).id, params);
        if (isServer) return getState();
    }
};

export default UserColumn;
