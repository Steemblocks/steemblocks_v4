import React from 'react';
import IrreversibleBlocksTable from '../../../components/Common/IrreversibleBlocksTable';
import './LatestBlocks.css';

const LatestBlocks = () => {

    return (
        <div className="latest-blocks-container">
            <IrreversibleBlocksTable
                showHeader={false}
                blockCount={10}
                className=""
                isLive={true}
            />
        </div>
    );
};

export default LatestBlocks;
