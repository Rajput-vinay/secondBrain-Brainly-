import { Request, Response } from 'express';
import { linkModel } from '../models/linkModel';

export const shareLink = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { shareLink } = req.params;

        // Validate if the shareLink exists
        if (!shareLink) {
            return res.status(400).json({
                message: "Share link is required."
            });
        }

        // Find the link by the hash and populate the user details
        const linkShared = await linkModel.findOne({ hash: shareLink }).populate('userId');

        // If the share link is not found
        if (!linkShared) {
            return res.status(404).json({ message: "Share link not found." });
        }

        // If found, return the link details
        return res.status(200).json({
            message: "Share link retrieved successfully.",
            data: linkShared
        });
    } catch (error) {
        console.error("Error retrieving share link:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
