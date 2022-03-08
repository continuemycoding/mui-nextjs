import MysqlHelper from '../../helper/MysqlHelper';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const result = await MysqlHelper.query("call bg_login(?, ?, ?);", [req.body.email, req.body.password, req.body.ip]);

    if (result.sqlMessage)
        return res.status(200).json({ errMsg: result.sqlMessage });

    return res.status(200).json(result);
};
