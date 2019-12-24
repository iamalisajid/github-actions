const core = require('@actions/core');
const github = require('@actions/github');
const asana = require('asana');

const ASANA_PAT = core.getInput('asana-pat'),
    SECTION_NAME = core.getInput('target-section'),
    COMMENT_PR_LINK = core.getInput('comment-pr-link'),
    TRIGGER_PHRASE = core.getInput('trigger-phrase'),
    PULL_REQUEST = github.context.payload.pull_request;

async function asanaOperations(ticketId, projectId, sectionName, commentPrLink) {
    const client = asana.Client.create({
        "defaultHeaders": {"asana-enable": "new-sections,string_ids"}
    }).useAccessToken(ASANA_PAT);

    try {
        if (sectionName) {
            let project = await client.sections.findByProject(projectId);
            if (project) {
                let requiredSection = project.find(data => data.name === sectionName);
                if (requiredSection) {
                    await client.sections.addTask(section.gid, {task: ticketId});
                    core.info('Moved to:', requiredSection.name);
                } else {
                    core.info('Section not found.')
                }
            } else {
                core.error('Project not found.')
            }

        }
        if (commentPrLink === 'true') {
            await client.tasks.addComment(ticketId, {
                text: PULL_REQUEST.html_url
            });
            core.info('PR Link Commented on ticket.');
        }
    } catch (ex) {
        core.error(ex.value);
    }
}

try {
    const regex = new
    RegExp(`\\*\\*${TRIGGER_PHRASE}:\\*\\* \\[.*?\\]\\(https:\\/\\/app.asana.com\\/(\\d+)\/(\\d+)\\/(\\d+).*?\\)`);
    let ticketId = null;
    let projectId = null;
    const parseAsanaURL = regex.exec(PULL_REQUEST.body);
    if (parseAsanaURL != null && parseAsanaURL.length >= 3) {
        ticketId = parseAsanaURL[3];
        projectId = parseAsanaURL[2];
    }
    if (ticketId !== null) {
        asanaOperations(ticketId, projectId, SECTION_NAME, COMMENT_PR_LINK)
    }
} catch (error) {
    core.error(error.message);
}
