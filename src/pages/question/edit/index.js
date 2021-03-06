import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { history, useSelector, useDispatch } from 'umi';
import { Button, message, Input, Alert, Form, Drawer, Space, Badge } from 'antd';
import Editor from '@/components/Editor';
import styles from './index.less';
import logo from '@/assets/logo.svg';
import moment from 'moment';
import Timer from '@/components/Timer';
import { Selector } from '@/components/Tag';
import { RouteContext } from '@/context';
import QuestionAlert from './components/Alert';
import Reward from './components/Reward';
import { UserAuthor } from '@/components/User';
import HistoryExtra from '../components/HistoryExtra';
const { SAVE_TYPE } = Editor.Biz;

function Edit({ match: { params } }) {
    const editor = useRef(null);
    const [id, setId] = useState(params.id ? parseInt(params.id) : null);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    //const [remark, setRemark] = useState('');
    const [reward, setReward] = useState({ type: 'default' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [drawerState, setDrawerState] = useState(false);
    const [collabUsers, setCollabUsers] = useState([]);
    const dispatch = useDispatch();

    const { detail } = useSelector((state) => state.doc);

    const bank = useSelector((state) => state.bank.detail) || {};
    const { isMobile } = useContext(RouteContext);
    useEffect(() => {
        if ((id && detail) || !id) {
            if (detail) {
                setTitle(detail.title);
                setTags(detail.tags);
            }
            setLoading(false);
        }
    }, [detail, id]);

    const onTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const onTitleBlur = () => {
        if (title.trim() === '' || saving) {
            return;
        }
        if (detail && detail.title.trim() === title.trim()) {
            return;
        }
        editor.current.onSave(SAVE_TYPE.FORCE, { title });
    };

    const onSave = useCallback(
        (action, res) => {
            if (action === 'begin') {
                setSaving(true);
            } else if (action === 'finish') {
                setSaving(false);
                const { result, data } = res || {};
                if (result && !id) {
                    const historyWin = window.history;
                    setId(data);
                    const url = `/question/${data}/edit`;
                    if (historyWin) {
                        historyWin.pushState(null, null, url);
                    } else {
                        history.replace({
                            pathname: url,
                        });
                    }
                }
            }
        },
        [id],
    );

    const onReverted = () => {
        // 重新加载页面
        window.location.reload();
    };

    const onShowDrawer = () => {
        setDrawerState(true);
    };

    const onHideDrawer = () => {
        setDrawerState(false);
    };

    const renderSaveStatus = () => {
        if (saving) {
            return '保存中...';
        }
        if (detail) {
            return <span>保存于 {moment(detail.updated_time).format('H:mm:ss')}</span>;
        }

        if (!loading && detail) {
            return (
                <span>
                    最后更改于
                    <Timer time={detail.updated_time} />
                </span>
            );
        }
    };

    /**const onModifyReasonChange = event => {
        setRemark(event.target.value);
    };**/

    /**const renderRemark = () => {
        return (
        <Form.Item label="修改原因" colon={false}>
            <Input.TextArea
            value={remark}
            onChange={onModifyReasonChange}
            autoSize={{
                minRows: 2,
                maxRows: 6,
            }}
            maxLength="150"
            />
        </Form.Item>
        );
    };**/

    const getError = () => {
        const titleText = title.trim();
        if (titleText === '') {
            return '你还没有添加标题';
        }

        if (['?', '？'].indexOf(titleText.substr(titleText.length - 1, 1)) < 0) {
            return '你还没有给问题添加问号';
        }

        const engine = editor.current.getEngine();
        const content = engine.getPureContent();
        if (Editor.Utils.isBlank(content)) {
            return '请详细说明问题';
        }

        if (tags.length === 0) {
            return '请至少添加一个标签';
        }

        /**if (doc && doc.published && remark === '') {
         return '请填写修改原因';
        }**/

        if (reward.type === 'credit' && reward.value > bank.credit) {
            return '积分余额不足';
        }

        if (reward.type === 'cash' && reward.value > bank.cash) {
            return '现金余额不足';
        }
    };

    const onPublish = () => {
        setPublishing(true);
        if (editor.current) {
            editor.current.onPublish({
                tags: tags.map((tag) => tag.id),
                reward,
                //remark,
            });
        }
    };

    const onPublished = useCallback((res) => {
        setPublishing(false);
        if (!res.result) {
            if (res.status === 1001 || res.status === 1002) {
                const { credit, cash } = res.data;
                dispatch({
                    type: 'user/setBank',
                    data: {
                        credit,
                        cash,
                    },
                });
            }
            return;
        }

        message.info('发布成功', 1, () => {
            window.location.href = '/question/' + res.data.id;
        });
    }, []);

    const renderCollabUsers = () => {
        if (isMobile) return null;
        return (
            <Space>
                {collabUsers.map((user) => (
                    <div key={user.id} className={styles['collab-user']}>
                        <UserAuthor model="avatar" size="small" info={user} />
                        <Badge color={user.color} />
                    </div>
                ))}
            </Space>
        );
    };

    const error = getError();

    return (
        <>
            {!loading && (
                <header className={styles.header}>
                    <div className={styles.container}>
                        <div className={styles.logo}>
                            <a href="/">
                                <img src={logo} alt="" />
                            </a>
                        </div>
                        {!isMobile && (
                            <small>
                                <span>·</span>提问编辑
                            </small>
                        )}
                        <div className={styles['save-status']}>{renderSaveStatus()}</div>
                        <div className={styles.right}>
                            {renderCollabUsers()}
                            {!isMobile && detail && (
                                <Button onClick={() => editor.current.showHistory()}>历史</Button>
                            )}
                            <Button type="primary" onClick={onShowDrawer}>
                                发布
                            </Button>
                        </div>
                    </div>
                </header>
            )}
            <div className={styles.container}>
                <div className={styles.title}>
                    <Input
                        className={styles['questions-title']}
                        size="large"
                        placeholder="一句话完整的描述你的问题"
                        value={title}
                        onChange={onTitleChange}
                        onBlur={onTitleBlur}
                        maxLength={50}
                    />
                </div>
                <QuestionAlert />
                <div className={styles['mini-editor']}>
                    <Editor
                        ref={editor}
                        id={id}
                        ot={true}
                        dataType="question"
                        toolbar={
                            isMobile
                                ? [
                                      ['heading', 'bold'],
                                      ['codeblock'],
                                      ['orderedlist', 'unorderedlist'],
                                      ['image', 'video', 'file'],
                                  ]
                                : null
                        }
                        toc={false}
                        historyExtra={(data) => <HistoryExtra {...data} />}
                        onSave={onSave}
                        onReverted={onReverted}
                        onPublished={onPublished}
                        onCollabUsers={setCollabUsers}
                    />
                </div>
            </div>
            <Drawer
                title="发布提问"
                placement="right"
                visible={drawerState}
                onClose={onHideDrawer}
                width={isMobile ? '100%' : 430}
            >
                <Form>
                    <Form.Item
                        label="设置标签"
                        extra="合适的标签，能方便分类检索，提问也更容易让回答者发现。"
                        colon={false}
                    >
                        <Selector values={tags} onChange={setTags} />
                    </Form.Item>
                    <Form.Item label="设置悬赏" extra="合理的悬赏，能快速得到解答" colon={false}>
                        <Reward
                            current={
                                detail
                                    ? { type: detail.reward_type, value: detail.reward_value }
                                    : null
                            }
                            data={reward}
                            onChange={setReward}
                            adopted={detail ? detail.adopted : null}
                        />
                    </Form.Item>
                    {error && <Alert description={error} type="error" showIcon />}
                    {!error && (
                        <Form.Item
                            extra="您将对提供的内容负有法律责任，对虚假和恶意营销，我们将保留追究法律责任的权利！"
                            colon={false}
                        >
                            <Button
                                disabled={error ? true : false}
                                loading={publishing}
                                type="primary"
                                onClick={onPublish}
                                style={{ width: '100%' }}
                            >
                                {publishing ? '提交中...' : '发布'}
                            </Button>
                        </Form.Item>
                    )}
                </Form>
            </Drawer>
        </>
    );
}
Edit.getInitialProps = async ({ isServer, store }) => {
    const { getState } = store;

    if (isServer) return getState();
};
export default Edit;
