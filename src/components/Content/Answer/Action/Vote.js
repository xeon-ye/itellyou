import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { useDispatch } from 'umi';
import { SupportButton, OpposeButton } from '@/components/Button';

export default ({
    id,
    question_id,
    support_count,
    use_support,
    allow_support,
    oppose_count,
    use_oppose,
    allow_oppose,
    size,
}) => {
    const dispatch = useDispatch();
    const [voting, setVoting] = useState(false);
    const [voteType, setVoteType] = useState();
    const [useSupport, setUseSupport] = useState(use_support);
    const [useOppose, setUseOppose] = useState(use_oppose);
    const [supportCount, setSupportCount] = useState(support_count);
    const [opposeCount, setOpposeCount] = useState(oppose_count);

    const doVote = (type) => {
        if (voting) return;
        setVoteType(type);
        setVoting(true);
        dispatch({
            type: 'answer/vote',
            payload: {
                id,
                question_id,
                type,
            },
        }).then(({ result, data }) => {
            if (result) {
                setSupportCount(data.support_count);
                setOpposeCount(data.oppose_count);
            }
            setVoting(false);
            if (type === 'support') {
                setUseOppose(false);
                setUseSupport(!useSupport);
            }
            if (type === 'oppose') {
                setUseOppose(!useOppose);
                setUseSupport(false);
            }
        });
    };

    const renderSupport = () => (
        <SupportButton
            active={useSupport}
            disabled={!allow_support}
            onClick={() => doVote('support')}
            //loading={voting && voteType === 'support'}
            count={supportCount}
            size={size}
        />
    );

    if (!allow_oppose) {
        return renderSupport();
    }

    return (
        <Space size="large">
            {renderSupport()}
            {allow_oppose && (
                <OpposeButton
                    active={useOppose}
                    onClick={() => doVote('oppose')}
                    //loading={voting && voteType === 'oppose'}
                    size={size}
                />
            )}
        </Space>
    );
};
