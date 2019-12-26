const core = require('@actions/core');
const github = require('@actions/github');
const asana = require('asana');


async function asanaOperations(ticketId, projectId, sectionName, commentPrLink, asanaPAT) {
    const client = asana.Client.create({
        "defaultHeaders": {"asana-enable": "new-sections,string_ids"}
    }).useAccessToken(asanaPAT);

    try {
        if (sectionName) {
            let project = await client.sections.findByProject(projectId);
            if (project) {
                let requiredSection = project.find(data => data.name === sectionName);
                if (requiredSection) {
                    await client.sections.addTask(requiredSection.gid, {task: ticketId});
                    core.info('Moved to:', requiredSection.name);
                } else {
                    core.error("Asana section " + requiredSection + " not found.")
                }
            } else {
                core.error("Asana project with id " + projectId + " not found.")
            }

        }
        if (commentPrLink === 'true') {
            await client.tasks.addComment(ticketId, {
                text: PULL_REQUEST.html_url
            });
            core.info("Added the pull request link to the Asana task.")
        }
    } catch (ex) {
        core.error(ex.value);
    }
}

try {
    const ASANA_PAT = core.getInput('asana-pat'),
        SECTION_NAME = core.getInput('target-section'),
        COMMENT_PR_LINK = core.getInput('comment-pr-link'),
        TRIGGER_PHRASE = core.getInput('trigger-phrase'),
        PULL_REQUEST = github.context.payload.pull_request,
        REGEX = new
        RegExp(`\\*\\*${TRIGGER_PHRASE}:\\*\\* \\[.*?\\]\\(https:\\/\\/app.asana.com\\/(\\d+)\/(\\d+)\\/(\\d+).*?\\)`);
    let ticketId = null, projectId = null;

    const parseAsanaURL = REGEX.exec(PULL_REQUEST.body);
    if (parseAsanaURL != null && parseAsanaURL.length >= 3) {
        ticketId = parseAsanaURL[3];
        projectId = parseAsanaURL[2];
    }
    if (ticketId !== null) {
        asanaOperations(ticketId, projectId, SECTION_NAME, COMMENT_PR_LINK, ASANA_PAT)
    }
} catch (error) {
    core.error(error.message);
}
